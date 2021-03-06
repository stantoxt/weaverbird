import { addNotInColumnNamesConstraint, StepFormType } from './utils';

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Substring step',
  type: 'object',
  properties: {
    name: {
      type: 'string',
      enum: ['substring'],
    },
    column: {
      type: 'string',
      minLength: 1,
      title: 'Extract a substring from...',
      description: 'The column from which you need extract a substring',
      attrs: {
        placeholder: 'Select a column',
      },
    },
    start_index: {
      type: 'integer',
      title: 'Substring starts at index...',
      description: 'The index at which starts the substring (begins at 0)',
      attrs: {
        placeholder: 'Enter an integer',
      },
      not: { const: 0 },
    },
    end_index: {
      type: 'integer',
      title: 'Number of characters to keep:',
      description: 'The index at which ends the substring (-1 = last index)',
      attrs: {
        placeholder: 'Enter an integer',
      },
      not: { const: 0 },
    },
    newColumnName: {
      type: 'string',
      minLength: 1,
      title: 'New column name',
      description: 'The new column name to be created for the computation result',
    },
  },
  required: ['column', 'start_index', 'end_index'],
  additionalProperties: false,
};

export default function buildSchema(form: StepFormType) {
  return addNotInColumnNamesConstraint(schema, 'newColumnName', form.columnNames);
}
