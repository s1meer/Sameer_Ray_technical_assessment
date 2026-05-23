import { InputNode }         from './InputNode';
import { OutputNode }        from './OutputNode';
import { LLMNode }           from './LLMNode';
import { TextNode }          from './TextNode';
import { APINode }           from './APINode';
import { KnowledgeBaseNode } from './KnowledgeBaseNode';
import { ConditionalNode }   from './ConditionalNode';
import { MemoryNode }        from './MemoryNode';

export { SPECS, PALETTE_GROUPS } from './specs';

export const nodeTypes = {
  customInput:   InputNode,
  customOutput:  OutputNode,
  llm:           LLMNode,
  text:          TextNode,
  api:           APINode,
  knowledgeBase: KnowledgeBaseNode,
  conditional:   ConditionalNode,
  memory:        MemoryNode,
};
