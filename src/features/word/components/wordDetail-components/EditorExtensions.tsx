import Comment from '@sereneinserenade/tiptap-comment-extension'
import { Collaboration } from '@tiptap/extension-collaboration'
import { CollaborationCursor } from '@tiptap/extension-collaboration-cursor'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import FontSize from '@tiptap/extension-font-size'
import Heading from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { Indent } from '@weiruo/tiptap-extension-indent'
import { Markdown } from 'tiptap-markdown'
import * as Y from 'yjs'
import { ListBox } from '../custom-command/CardCommand'
import { Link } from '../custom-command/LinkCommand'
import { Board } from '../custom-command/board'
import { Flowchart } from '../custom-command/flow-chart'
import { Video } from '../custom-command/video'

export function getEditorExtensions(provider: any, email: string) {
  return [
    StarterKit.configure({
      history: false,
    }),
    TextStyle,
    Placeholder.configure({
      placeholder: 'Write something …',
      emptyEditorClass: 'is-editor-empty',
    }),
    Underline,
    Comment.configure({
      HTMLAttributes: {
        class: 'my-comment',
      },
      onCommentActivated: (commentId) => {
        // This will be handled by the parent component
      },
    }),
    Color,
    Image,
    TaskList,
    TaskItem,
    ListBox,
    Flowchart,
    Collaboration.extend().configure({
      document: provider.document,
    }),
    CollaborationCursor.configure({
      provider: provider,
      user: {
        name: email,
        color: '#f783ac',
      },
    }),
    FontFamily.configure({
      types: ['textStyle'],
    }),
    Indent.configure({
      types: ['listItem', 'paragraph'],
      minLevel: 0,
      maxLevel: 1,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Video,
    Board,
    Link,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Highlight.configure({
      multicolor: true,
    }),
    Heading.configure({
      levels: [1, 2, 3, 4, 5, 6],
    }),
    FontSize,
    Markdown.configure({
      html: true,
      tightLists: true,
      tightListClass: 'tight',
      bulletListMarker: '-',
      linkify: false,
      breaks: false,
      transformPastedText: false,
      transformCopiedText: false,
    }),
  ]
}
