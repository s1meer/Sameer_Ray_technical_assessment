export const SPECS = {
  customInput:   { label:'Input',          icon:'log-in',        category:'io',    description:'Pipeline entry point',       width:240, defaultData:{ name:'input_1',  dataType:'Text' } },
  customOutput:  { label:'Output',         icon:'log-out',       category:'io',    description:'Final pipeline result',      width:240, defaultData:{ name:'output_1', dataType:'Text' } },
  llm:           { label:'LLM',            icon:'sparkles',      category:'llm',   description:'Language model call',        width:240, defaultData:{ model:'gpt-4o', temperature:0.7, maxTokens:1024 } },
  text:          { label:'Text',           icon:'type',          category:'logic', description:'Template with {{variables}}',width:280, defaultData:{ text:'{{input}}' } },
  api:           { label:'API Call',       icon:'cable',         category:'data',  description:'HTTP request',               width:280, defaultData:{ method:'POST', url:'' } },
  knowledgeBase: { label:'Knowledge Base', icon:'database',      category:'data',  description:'Vector retrieval',           width:260, defaultData:{ index:'company-handbook', embedding:'text-embedding-3-small', topK:4 } },
  conditional:   { label:'Conditional',    icon:'git-branch',    category:'logic', description:'Branch on condition',        width:240, defaultData:{ expr:'' } },
  memory:        { label:'Chat Memory',    icon:'message-square',category:'data',  description:'Conversation history',       width:240, defaultData:{ strategy:'sliding-window', window:10 } },
};

export const PALETTE_GROUPS = [
  { id:'io',    label:'Input / Output', types:['customInput','customOutput'] },
  { id:'llm',   label:'AI',             types:['llm'] },
  { id:'data',  label:'Data',           types:['knowledgeBase','api','memory'] },
  { id:'logic', label:'Logic',          types:['text','conditional'] },
];
