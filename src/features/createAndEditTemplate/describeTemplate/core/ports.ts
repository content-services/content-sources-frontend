// input ports
// dependent on Yup library for validation
export type InputAndValidateTemplateTitle = (rawValue: string) => void;
export type InputAndValidateTemplateDetail = (rawValue: string) => void;

// output ports
// read from top level store - title, detail
// set data in top level store - setTitle, setDetail
