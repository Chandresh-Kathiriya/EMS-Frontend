import React from 'react';
import DataTable from '../../../Components/DataTable';

const columns = [
  { Header: 'Project', accessor: 'name', sortable: true },
  { Header: 'Progress', accessor: 'progress', sortable: true },
  { Header: 'Status', accessor: 'status', sortable: true },
];

function ProjectTable({ data, pagination, onEdit, onDelete, onPrevious, onNext, onPageSizeChange, editable }) {
  return (
    <div className="row">
      <div className="col-lg-12">
        <DataTable
          columns={columns}
          data={data}
          pagination={pagination}
          onEdit={onEdit}
          onDelete={onDelete}
          onClickPrevious={onPrevious}
          onClickNext={onNext}
          onPageSizeChange={onPageSizeChange}
          editButton={editable}
          deleteButton={editable}
          footer
        />
      </div>
    </div>
  );
}

export default ProjectTable;
