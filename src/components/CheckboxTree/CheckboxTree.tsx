import React, { Key, useCallback, useMemo } from 'react';
import produce from 'immer';
import { fromPairs, noop } from 'lodash';
import Tree from '../Tree';
import Leaf from './components/Leaf';
import { findNodeDeep, normalizeTree, setValuesRecursive } from './helpers';
import { CheckboxTreeProps } from './types';
import { CheckboxTreeLeafProps } from './components/Leaf/types';

function CheckboxTree<
  NodeObjectType extends {
    childNodes?: NodeObjectType[];
    disabled?: boolean;
    id: string;
  }
>({
  nodes = [],
  checkedKeys = [],
  onChange = noop,
  renderLeaf: providedRenderLeaf,
  ...props
}: CheckboxTreeProps<NodeObjectType>) {
  const treeValues = useMemo(
    () => fromPairs(checkedKeys.map((item) => [item, true])),
    [checkedKeys]
  );

  const handleChange = useCallback(
    (value: boolean, nodeId: Key): void => {
      const newValues = produce(treeValues, (draft) => {
        const node = findNodeDeep(nodes, nodeId);
        setValuesRecursive(node, draft, value);
        normalizeTree(nodes, draft);
      });
      onChange(Object.keys(newValues).filter((key) => newValues[key]));
    },
    [onChange, nodes, treeValues]
  );

  const renderLeaf = (props: CheckboxTreeLeafProps<NodeObjectType>) => (
    <Leaf {...props} render={providedRenderLeaf} />
  );

  return (
    // @ts-ignore
    <Tree<NodeObjectType, CheckboxTreeLeafProps<NodeObjectType>>
      {...props}
      onChange={handleChange}
      nodes={nodes}
      checkedKeysObject={treeValues}
      renderLeaf={renderLeaf}
    />
  );
}

export default CheckboxTree;
