import { definePlugin } from 'remark-expressive-code';

interface HastNode {
	type: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

/**
 * Injects a custom copy-to-clipboard button into every rendered code block.
 *
 * Inspired by the expressive-code plugin used on nostalgia296.github.io, but
 * restyled to match this site's iOS design system: stroke-based (lucide-style)
 * icons, a frosted pill button and a green success check.
 *
 * The button is rendered as the last child of the `pre` element and styled
 * with the `.copy-btn` class (see `src/routes/layout.css`). The click handler
 * lives in the docs page component.
 */
export function pluginCopyButton() {
	return definePlugin({
		name: 'Copy Button',
		hooks: {
			postprocessRenderedBlock: (context) => {
				const svgAttrs: Record<string, string> = {
					viewBox: '0 0 24 24',
					fill: 'none',
					stroke: 'currentColor',
					'stroke-width': '2',
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round',
					'aria-hidden': 'true'
				};

				function processCodeBlock(node: HastNode) {
					const copyButton: HastNode = {
						type: 'element',
						tagName: 'button',
						properties: {
							className: ['copy-btn'],
							type: 'button',
							'aria-label': 'Copy code'
						},
						children: [
							{
								type: 'element',
								tagName: 'span',
								properties: { className: ['copy-btn-icon'] },
								children: [
									{
										type: 'element',
										tagName: 'svg',
										properties: { ...svgAttrs, className: ['copy-btn-svg', 'copy-icon'] },
										children: [
											{
												type: 'element',
												tagName: 'rect',
												properties: { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' },
												children: []
											},
											{
												type: 'element',
												tagName: 'path',
												properties: {
													d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'
												},
												children: []
											}
										]
									},
									{
										type: 'element',
										tagName: 'svg',
										properties: {
											...svgAttrs,
											'stroke-width': '2.5',
											className: ['copy-btn-svg', 'success-icon']
										},
										children: [
											{
												type: 'element',
												tagName: 'path',
												properties: { d: 'M20 6 9 17l-5-5' },
												children: []
											}
										]
									}
								]
							}
						]
					};

					if (!node.children) {
						node.children = [];
					}
					node.children.push(copyButton);
				}

				function traverse(node: HastNode) {
					if (node.type === 'element' && node.tagName === 'pre') {
						processCodeBlock(node);
						return;
					}
					if (node.children) {
						for (const child of node.children) {
							if (child.type === 'element') traverse(child);
						}
					}
				}

				traverse(context.renderData.blockAst);
			}
		}
	});
}
