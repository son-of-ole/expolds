import { mergeClasses } from '@expo/styleguide';
import { AlertCircleDuotoneIcon } from '@expo/styleguide-icons/duotone/AlertCircleDuotoneIcon';
import { AlertTriangleDuotoneIcon } from '@expo/styleguide-icons/duotone/AlertTriangleDuotoneIcon';
import { InfoCircleDuotoneIcon } from '@expo/styleguide-icons/duotone/InfoCircleDuotoneIcon';
import { XSquareDuotoneIcon } from '@expo/styleguide-icons/duotone/XSquareDuotoneIcon';
import {
  Children,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from 'react';

type CalloutType = 'default' | 'important' | 'warning' | 'error' | 'info' | 'info-light';

type Props = PropsWithChildren<{
  type?: CalloutType;
  className?: string;
  icon?: ComponentType<HTMLAttributes<SVGSVGElement>>;
  size?: 'sm' | 'md';
}>;

const extractType = (childrenArray: ReactNode[]) => {
  const firstChild = Children.toArray(childrenArray[0])[0];

  if (isValidElement<PropsWithChildren>(firstChild)) {
    if (typeof firstChild.props.children === 'string') {
      return firstChild.props.children.toLowerCase();
    }
    if (Array.isArray(firstChild.props.children)) {
      return firstChild.props.children[0].toLowerCase();
    }
  }

  return false;
};

export const InlineHelp = ({ type = 'default', size = 'md', icon, children, className }: Props) => {
  const content = Children.toArray(children).filter(child => isValidElement(child))[0];
  const contentChildren = Children.toArray(
    isValidElement<PropsWithChildren>(content) && content?.props?.children
  );

  const extractedType = extractType(contentChildren);
  const finalType = ['warning', 'error', 'info', 'important'].includes(extractedType)
    ? extractedType
    : type;
  const Icon = icon ?? getCalloutIcon(finalType);

  return (
    <blockquote
      className={mergeClasses(
        'mb-4 flex gap-2.5 rounded-md border border-default bg-subtle py-3 pl-3.5 pr-4 shadow-xs',
        size === 'sm' && 'gap-2 px-3 py-2.5',
        '[table_&]:last:mb-0',
        '[&_code]:bg-element',
        getCalloutColor(finalType),
        // TODO(simek): remove after migration to new components is completed
        '[&_p]:!mb-0',
        className
      )}
      data-testid="callout-container">
      <Icon
        className={mergeClasses(
          'mt-1 select-none',
          size === 'sm' ? 'icon-xs mt-[3px]' : 'icon-sm',
          getCalloutIconColor(finalType)
        )}
      />
      <div
        className={mergeClasses(
          'w-full leading-normal text-default',
          'last:mb-0',
          size === 'sm' && 'text-xs [&_code]:text-[90%] [&_p]:text-xs'
        )}>
        {type === finalType ? children : contentChildren.filter((_, i) => i !== 0)}
      </div>
    </blockquote>
  );
};

function getCalloutColor(type: CalloutType) {
  switch (type) {
    case 'warning':
      return mergeClasses(
        'border-warning bg-warning',
        `[&_code]:border-palette-yellow5 [&_code]:bg-palette-yellow4`,
        `selection:bg-palette-yellow5 dark:selection:bg-palette-yellow6`,
        `dark:[&_code]:border-palette-yellow6 dark:[&_code]:bg-palette-yellow5`
      );
    case 'important':
      return mergeClasses(
        'border-palette-purple7 bg-palette-purple3',
        `[&_code]:border-palette-purple5 [&_code]:bg-palette-purple4`,
        `selection:bg-palette-purple5 dark:selection:bg-palette-purple6`,
        `dark:[&_code]:border-palette-purple6 dark:[&_code]:bg-palette-purple5`
      );
    case 'error':
      return mergeClasses(
        'border-danger bg-danger',
        `[&_code]:border-palette-red6 [&_code]:bg-palette-red5`,
        `selection:bg-palette-red5 dark:selection:bg-palette-red6`
      );
    case 'info':
      return mergeClasses(
        'border-info bg-info',
        `[&_code]:border-palette-blue5 [&_code]:bg-palette-blue4`,
        `dark:selection:bg-palette-blue6`
      );
    case 'info-light':
      return mergeClasses('bg-default');
    default:
      return null;
  }
}

function getCalloutIcon(type: CalloutType): (props: HTMLAttributes<SVGSVGElement>) => ReactElement {
  switch (type) {
    case 'warning':
      return AlertTriangleDuotoneIcon;
    case 'important':
      return AlertCircleDuotoneIcon;
    case 'error':
      return XSquareDuotoneIcon;
    default:
      return InfoCircleDuotoneIcon;
  }
}

function getCalloutIconColor(type: CalloutType) {
  switch (type) {
    case 'warning':
      return 'text-warning';
    case 'important':
      return 'text-palette-purple11';
    case 'error':
      return 'text-danger';
    case 'info':
      return 'text-info';
    case 'info-light':
      return 'text-icon-secondary';
    default:
      return 'text-icon-default';
  }
}
