import { Column, ColumnOptions } from 'typeorm';

export function DbAwareColumn(options: ColumnOptions = {}) {
  return function (object: any, propertyName: string) {
    if (process.env.NODE_ENV === 'test') {
      return Column({
        ...options,
        type: 'simple-json',
      })(object, propertyName);
    } else {
      return Column({
        ...options,
        type: 'jsonb',
      })(object, propertyName);
    }
  };
}
