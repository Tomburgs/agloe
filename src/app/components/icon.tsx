import { createElement, CSSProperties, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { skeleton } from 'styles/skeleton';
import { css } from 'otion';

const SIZE = 24;

const icon = css({
  display: 'inline-block',
  height: SIZE,
  width: SIZE,
});

const placeholder =
  skeleton +
  css({
    borderRadius: '50%',
  });

interface IconProps {
  name: string;
  className?: string;
  style?: CSSProperties;
}

const Loader = ({ style, className = '' }: IconProps): JSX.Element => (
  <span style={style} className={`${icon} ${placeholder} ${className}`} />
);

export function Icon(props: IconProps): JSX.Element {
  const { name, style, className: argClassName = '' } = props;
  const className = `${icon} ${argClassName}`;

  const element = useMemo(
    () =>
      createElement(
        dynamic<IconProps>(() => import(`icons/${name}.svg`), {
          loading: () => <Loader name={name} style={style} className={props.className} />,
        }),
        { name, style, className }
      ),
    [name, style, className, props.className]
  );

  return element;
}
