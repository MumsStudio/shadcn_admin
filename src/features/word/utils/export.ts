import { saveAs } from 'file-saver'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { jsPDF } from 'jspdf';

export const exportToPDF = async (html: string, title: string) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm'
  });

  // 创建临时容器并设置唯一标识
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.setAttribute('data-temp-pdf', 'true');
  document.body.appendChild(tempContainer);

  try {
    // 读取并处理 index.css 文件
    const response = await fetch('../../../index.css');
    const cssText = await response.text();
    const cleanedCss = cssText
      .replace(/oklch\([^)]+\)/g, '#000000')
      .replace(/color-mix\([^)]+\)/g, '#000000')
      .replace(/var\(--[\w-]+\)/g, '#000000');

    // 创建 style 元素并插入处理后的 CSS
    const styleElement = document.createElement('style');
    styleElement.textContent = cleanedCss;
    tempContainer.appendChild(styleElement);

    // 深度清理 HTML 中的不支持的 CSS 颜色格式
    const cleanedHtml = html
      // 处理 style 标签中的 oklch
      .replace(/<style>([\s\S]*?)<\/style>/g, (match, styleContent) => {
        const cleanedStyle = styleContent
          .replace(/oklch\([^)]+\)/g, '#000000')
          .replace(/color-mix\([^)]+\)/g, '#000000')
          .replace(/var\(--[\w-]+\)/g, '#000000');
        return `<style>${cleanedStyle}</style>`;
      })
      // 处理内联样式中的 oklch
      .replace(/style="([^"]*)"/g, (match, styleContent) => {
        const cleanedStyle = styleContent
          .replace(/oklch\([^)]+\)/g, '#000000')
          .replace(/color-mix\([^)]+\)/g, '#000000')
          .replace(/var\(--[\w-]+\)/g, '#000000');
        return `style="${cleanedStyle}"`;
      })
      // 处理直接的颜色属性
      .replace(/(color|background-color|border-color|fill|stroke)\s*:\s*oklch\([^)]+\)/g, '$1: #000000')
      // 移除可能包含 oklch 的 @ 规则
      .replace(/@[^{}]*\{[^{}]*oklch\([^)]+\)[^{}]*\}/g, '');

    // 将清理后的 HTML 放入临时容器
    tempContainer.innerHTML += cleanedHtml;

    // 等待所有资源加载
    await Promise.all(
      Array.from(tempContainer.getElementsByTagName('img')).map(img =>
        img.complete ? Promise.resolve() : new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve; // 即使图片加载失败也继续
        })
      )
    );

    // 生成 PDF
    await pdf.html(tempContainer, {
      callback: (pdf) => {
        pdf.save(`${title}.pdf`);
      },
      width: 190, // A4 宽度(210mm)减去边距
      windowWidth: tempContainer.scrollWidth,
      autoPaging: 'text',
      margin: [10, 10, 10, 10],
      html2canvas: {
        scale: 0.5,
        useCORS: true,
        allowTaint: true,
        logging: true // 开启日志便于调试
      }
    });

  } catch (error) {
    console.error('生成 PDF 时出错：', error);
    throw new Error(`PDF 导出失败: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // 确保清理临时容器
    if (tempContainer.parentNode) {
      document.body.removeChild(tempContainer);
    }
  }
};

export const exportToWord = async (html: string, title: string) => {
  const div = document.createElement('div')
  div.innerHTML = html

  const elements = Array.from(div.querySelectorAll('p, h1, h2, h3, h4, h5, h6')).map(
    (el) => {
      if (el.tagName.toLowerCase() === 'p') {
        return new Paragraph({
          children: [new TextRun(el.textContent || '')]
        })
      } else {
        // 处理标题元素
        const level = parseInt(el.tagName.substring(1))
        return new Paragraph({
          heading: `Heading${Math.min(level, 6)}` as any,
          children: [new TextRun({
            text: el.textContent || '',
            bold: true,
            size: 36 - (level * 4)
          })]
        })
      }
    }
  )

  const doc = new Document({
    sections: [{
      children: elements
    }]
  })

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${title}.docx`)
  })
}