import { css } from 'otion';
import { colors } from 'styles/colors';
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
  minWidth: 36,
  width: 36,
  height: 36,
  borderRadius: '50%',
  backgroundColor: '#679595',
  selectors: {
    '& path': {
      fill: '#fafafa',
    },
  },
});

const note = css({
  fontSize: typography.size[5],
  color: typography.color.tertiary,
});

const name = css({
  display: 'flex',
  flexFlow: 'column',
  textAlign: 'left',
});

interface ResultProps {
  entity: Entity;
}

const TYPE_ATTRIBUTES: Record<
  string,
  {
    icon: string;
    color: string;
    note?: string;
    y?: number;
    x?: number;
  }
> = {
  unknown: {
    icon: 'location',
    color: colors.blue,
  },
  building: {
    icon: 'bank',
    color: colors.red,
    y: -2,
  },
  store: {
    icon: 'bag',
    color: colors.yellow,
    note: 'Shop',
  },
  cafe: {
    icon: 'wine-glass',
    color: colors.yellow,
    note: 'Cafe / Bar',
  },
  restaurant: {
    icon: 'pizza',
    color: colors.yellow,
    note: 'Restaurant / Eatery',
    x: 2,
  },
  transport: {
    icon: 'metro',
    color: colors.blue,
    note: 'Public transport',
  },
  office: {
    icon: 'building',
    color: colors.red,
  },
  way: {
    icon: 'direction',
    color: colors.blue,
  },
  park: {
    icon: 'trees',
    color: colors.pink,
  },
  museum: {
    icon: 'bank',
    color: colors.red,
    note: 'Museum',
    y: -2,
  },
  hostel: {
    icon: 'bank',
    color: colors.red,
    note: 'Hostel',
    y: -2,
  },
  university: {
    icon: 'mortarboard',
    color: colors.red,
    note: 'University',
    y: -2,
    x: 2,
  },
  diplomatic: {
    icon: 'bank',
    color: colors.red,
    note: 'Embassy / Diplomatic',
    y: -2,
  },
  pharmacy: {
    icon: 'health',
    color: colors.red,
    note: 'Pharmacy',
  },
  artwork: {
    icon: 'archway',
    color: colors.pink,
    note: 'Artwork',
  },
};

const getEntityAttributes = (entity: Entity): keyof typeof TYPE_ATTRIBUTES => {
  const { tags } = entity;

  if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food') {
    return 'restaurant';
  }

  if (
    tags.amenity === 'cafe' ||
    tags.amenity === 'bar' ||
    tags['disused:amenity'] === 'bar'
  ) {
    return 'cafe';
  }

  if (tags.amenity === 'pharmacy') {
    return 'pharmacy';
  }

  if (tags.public_transport) {
    return 'transport';
  }

  if (tags.amenity === 'university') {
    return 'university';
  }

  if (tags.amenity === 'embassy' || tags.office === 'diplomatic') {
    return 'diplomatic';
  }

  if (tags.tourism === 'museum') {
    return 'museum';
  }

  if (tags.tourism === 'hostel') {
    return 'hostel';
  }

  if (tags.tourism === 'artwork') {
    return 'artwork';
  }

  if (tags.shop) {
    return 'store';
  }

  if (tags.building === 'office') {
    return 'office';
  }

  if (tags.leisure === 'park') {
    return 'park';
  }

  if (entity.type === 'node') {
    return 'building';
  }

  if (entity.type === 'way') {
    return 'way';
  }

  return 'unknown';
};

export function Result({ entity }: ResultProps): JSX.Element {
  const type = getEntityAttributes(entity);
  const attributes = TYPE_ATTRIBUTES[type];

  return (
    <div className={result}>
      <span className={icon} style={{ backgroundColor: attributes.color }}>
        <Icon
          name={attributes.icon}
          style={{ marginTop: attributes?.y, marginLeft: attributes?.x }}
        />
      </span>
      <div className={name}>
        <span>{entity.name}</span>
        {attributes.note && <span className={note}>{attributes.note}</span>}
      </div>
    </div>
  );
}
