export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  placeholder?: string;
  required?: boolean;
}

export interface FormSchema {
  id: string;
  title: string;
  fields: FormField[];
}

export const FORM_SCHEMAS: Record<string, FormSchema> = {
  purchase_order: {
    id: 'purchase_order',
    title: 'Purchase Order',
    fields: [
      { name: 'vendor_name', label: 'Vendor Name', type: 'text', placeholder: 'Enter vendor name', required: true },
      { name: 'item_name', label: 'Item / Product', type: 'text', placeholder: 'e.g. Portland Cement', required: true },
      { name: 'quantity', label: 'Quantity', type: 'number', placeholder: '0', required: true },
      { name: 'price', label: 'Expected Price', type: 'number', placeholder: '0' },
      { name: 'notes', label: 'Notes', type: 'text', placeholder: 'Additional instructions...' },
    ]
  }
};

export const INTENT_TO_SCHEMA: Record<string, string> = {
  'CREATE_PO': 'purchase_order'
};
