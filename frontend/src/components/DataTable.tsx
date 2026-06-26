import type { ReactNode } from 'react';
import './DataTable.css';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T, rowIndex: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Array<DataTableColumn<T>>;
  data: T[];
}

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div className="data-table__wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={String((row as Record<string, unknown>).id ?? rowIndex)}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row, rowIndex)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
