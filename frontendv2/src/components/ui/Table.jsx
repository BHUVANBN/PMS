import { clsx } from 'clsx';

const Table = ({ children, className = '', ...props }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table
        className={clsx('min-w-full divide-y divide-neutral-300', className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({ children, className = '', ...props }) => {
  return (
    <thead className={clsx('bg-neutral-50', className)} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '', ...props }) => {
  return (
    <tbody
      className={clsx('divide-y divide-neutral-200 bg-white', className)}
      {...props}
    >
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', ...props }) => {
  return (
    <tr className={clsx('hover:bg-neutral-50', className)} {...props}>
      {children}
    </tr>
  );
};

const TableHeaderCell = ({ children, className = '', ...props }) => {
  return (
    <th
      className={clsx(
        'px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
};

const TableCell = ({ children, className = '', ...props }) => {
  return (
    <td
      className={clsx('px-6 py-4 whitespace-nowrap text-sm text-neutral-900', className)}
      {...props}
    >
      {children}
    </td>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;

export default Table;
