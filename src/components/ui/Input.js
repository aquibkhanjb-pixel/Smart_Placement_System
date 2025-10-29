import clsx from 'clsx';

const Input = ({
  label,
  error,
  help,
  type = 'text',
  multiline = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputClasses = clsx(
    'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400',
    'focus:outline-none focus:ring-blue-500 focus:border-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500',
    {
      'border-red-300 focus:ring-red-500 focus:border-red-500': error,
    },
    className
  );

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <InputComponent
        type={multiline ? undefined : type}
        className={inputClasses}
        {...props}
      />
      {help && (
        <p className="mt-1 text-sm text-gray-500">{help}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;