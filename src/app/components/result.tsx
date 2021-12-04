import { css } from 'otion';
import {colors} from 'styles/colors';
import { typography } from 'styles/typography';
import { Icon } from './icon';

const result = css({
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  gap: 20,
  color: '#2E3A59',
  fontSize: typography.size[2],
  width: '100%',
  height: '60px',
});

const icon = css({
  display: 'grid',
  placeItems: 'center',
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: '#679595',
  selectors: {
    '& path': {
      fill: '#fafafa',
    }
  }
});

interface ResultProps {
  entity: Entity;
}

const TYPE_ATTRIBUTES: Record<
  string,
  {
    icon: string;
    color: string;
    y?: number;
    x?: number
  }
> = {
  building: {
    icon: 'bank',
    color: colors.red,
    y: -2,
  },
  unknown: {
    icon: 'location',
    color: colors.blue,
  },
  store: {
    icon: 'bag',
    color: colors.yellow,
  },
  cafe: {
    icon: 'wine-glass',
    color: colors.yellow,
  },
  restaurant: {
    icon: 'pizza',
    color: colors.yellow,
    x: 2,
  },
};

const getEntityAttributes = (entity: Entity): keyof typeof TYPE_ATTRIBUTES => {
  const { tags } = entity;

  if (tags.amenity === 'restaurant') {
    return 'restaurant';
  }

  if (tags.amenity === 'cafe') {
    return 'cafe';
  }

  if (tags.shop) {
    return 'store';
  }

  if (entity.type === 'node') {
    return 'building';
  }

  return 'unknown';
}

export function Result({ entity }: ResultProps): JSX.Element {
  const type = getEntityAttributes(entity);
  const attributes = TYPE_ATTRIBUTES[type];

  return (
    <div className={result}>
      <span
        className={icon}
        style={{ backgroundColor: attributes.color }}
      >
        <Icon
          name={attributes.icon}
          style={{ marginTop: attributes?.y, marginLeft: attributes?.x }}
        />
      </span>
      {entity.name}
    </div>
  );
}

