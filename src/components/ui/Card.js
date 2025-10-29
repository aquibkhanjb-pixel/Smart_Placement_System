import clsx from 'clsx';

const Card = ({ children, className = '', padding = 'md', ...props }) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: ''
  };

  return (
    <div
      className={clsx(
        'bg-white shadow-md rounded-lg border border-gray-200',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={clsx('mb-4', className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={clsx('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={clsx(className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardContent };
export default Card;