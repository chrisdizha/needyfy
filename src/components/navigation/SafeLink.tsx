import React from 'react';
import { Link, LinkProps, useInRouterContext } from 'react-router-dom';

// SafeLink: uses react-router Link when inside a Router; falls back to a normal anchor otherwise
export const SafeLink: React.FC<LinkProps & { className?: string }> = ({ to, children, ...rest }) => {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return (
      <Link to={to} {...rest}>
        {children}
      </Link>
    );
  }
  const href = typeof to === 'string' ? to : (to as any).pathname || '#';
  return (
    <a href={href} {...(rest as any)}>
      {children}
    </a>
  );
};

export default SafeLink;
