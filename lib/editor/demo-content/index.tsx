import React, { useCallback, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { select, dispatch, useSelect } from '@wordpress/data';
import { Button, Flex, Icon, PanelBody } from '@wordpress/components';
import { BlockInstance, createBlock } from '@wordpress/blocks';

import './style.css';

interface Props {
	variants: any;
}

export const DemoContentPanel = ({ variants }: Props) => {
	const [isGenerating, setIsGenerating] = useState(false);

	const blockTypes = useSelect(
		(select) => select('core/blocks').getBlockTypes(),
		[]
	);

	const generateAllBlocks = useCallback(async () => {
		const blockIds = select('core/block-editor')
			.getBlocks()
			.map((block: BlockInstance) => block.clientId);
		dispatch('core/block-editor').removeBlocks(blockIds);

		const instances: Array<BlockInstance> = [];

		blockTypes
			.filter((block: any) => !!block.example) // Only blocks with example data will be inserted
			.forEach((block: any) => {
				const { attributes, innerBlocks } = block.demoExample ?? block.example;

				// All blocks which have a variant
				if (
					variants &&
					(block.attributes?.variant)
				) {
					// Create a section example for each variant
					variants.forEach((variant: any) => {
						const attrs = {
							...attributes,
							variant: variant.key,
						};

						// Note: it's important to create one instance per variant, else we end up using twice the same instance of a block
						// …which cause the following problem: you click on the 1st instance, it selects the 2nd one
						const innerBlockInstances = innerBlocks
							? getInnerBlockInstances(innerBlocks)
							: [];

						instances.push(
							createBlock(block.name, attrs, innerBlockInstances)
						);
					});
				}
			});

		await dispatch('core/block-editor').insertBlocks(
			instances,
			undefined,
			undefined,
			false
		);
	}, [blockTypes, variants]);

	/**
	 * Recursive function that creates a WP block for each innerBlocks
	 * @param innerBlocks Array of inner blocks
	 * @returns Array of inner block instances
	 */
	const getInnerBlockInstances = (innerBlocks: any) => {
		return innerBlocks.reduce((acc: any, block: any) => {
			// Only create a block for inner blocks that exist in the available block types
			// (blocks may not exist because of unregistering Starterpack blocks for a specific project)
			if(blockTypes.filter(b => b.name === block.name).length > 0) {
				const childInnerBlockInstances = block.innerBlocks
					? getInnerBlockInstances(block.innerBlocks)
					: [];

					acc.push(createBlock(
					block.name,
					block.attributes,
					childInnerBlockInstances
				));
			}

			return acc;

		}, []);
	};

	const onClick = useCallback(async () => {
		if (
			window.confirm(
				__("If you accept, all page's content will be lost", 'supt')
			)
		) {
			setIsGenerating(true);
			await new Promise((r) => setTimeout(r, 100)); // make sure UI gets updated before heavy task
			await generateAllBlocks();
			await dispatch('core/editor').savePost();
			setIsGenerating(false);
		}
	}, []);

	return (
		<PanelBody
			icon="edit"
			title={__('Demo content', 'supt')}
			initialOpen={false}
			className="supt-panel-demo-content"
		>
			<Flex
				justify="flex-start"
				style={{
					color: 'red',
					marginTop: '10px',
					marginBottom: '10px',
				}}
			>
				<Icon icon="warning" size={24} />
				<strong>{__('Danger zone', 'supt')}</strong>
			</Flex>
			<p>
				{__(
					'Update the page content to contain all blocks with all variants to review all possibilities.',
					'supt'
				)}
			</p>

			<Button
				isPrimary
				onClick={onClick}
				disabled={isGenerating}
				isBusy={isGenerating}
			>
				{isGenerating
					? __('Generating…', 'supt')
					: __('Generate demo content', 'supt')}
			</Button>
		</PanelBody>
	);
};

export default DemoContentPanel;
