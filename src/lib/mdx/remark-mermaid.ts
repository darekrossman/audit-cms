import type { Code, Root } from 'mdast'
import type { Plugin } from 'unified'
import { visit } from 'unist-util-visit'

/**
 * Remark plugin that transforms mermaid code blocks into custom MDX elements.
 * This allows them to bypass Shiki syntax highlighting and be rendered
 * by a custom Mermaid component instead.
 */
export const remarkMermaid: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang === 'mermaid' && parent && typeof index === 'number') {
        // Replace the code block with a custom MDX element
        const mermaidNode = {
          type: 'mdxJsxFlowElement',
          name: 'MermaidDiagram',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'chart',
              value: node.value,
            },
          ],
          children: [],
        }
        parent.children[index] = mermaidNode as unknown as Code
      }
    })
  }
}
