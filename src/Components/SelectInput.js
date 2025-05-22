import React from 'react';
import Select, { components } from 'react-select';

const SelectInput = ({
  options,
  value,
  onChange,
  placeholder,
  changeColor = false,
  isClearable = true,
  isDisabled = false,
  onlyArrow = false, // NEW: prop to control minimal mode
}) => {
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: changeColor ? '#EFF2F8' : 'white',
      border: 'none',
      boxShadow: 'none',
      cursor: 'pointer',
      minWidth: '10vw',
    }),
    ...(onlyArrow && {
      input: (provided) => ({
        ...provided,
        width: 0,
        height: 0,
        opacity: 0,
        padding: 0,
        margin: 0,
      }),
      singleValue: () => ({ display: 'none' }),
      placeholder: () => ({ display: 'none' }),
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#338db5' : 'transparent',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: '#338db5',
        color: 'white',
      },
    }),
    menu: (provided) => ({
      ...provided,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
    }),
  };
  
  // Components override: show only dropdown arrow
  const customComponents = onlyArrow
  ? {
      Control: (props) => (
        <components.Control {...props}>
          {/* Let react-select render the input inside */}
          <components.DropdownIndicator {...props} />
        </components.Control>
      ),
      SingleValue: () => null,
      Placeholder: () => null,
    }
  : {};  

  return (
    <div>
      <Select
        className="m-0 p-0"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={options}
        styles={customStyles}
        isClearable={isClearable}
        isDisabled={isDisabled}
        components={customComponents}
      />
    </div>
  );
  
};

export default SelectInput;
