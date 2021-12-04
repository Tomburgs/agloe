import { Icon } from 'components/icon';
import { Result } from 'components/result';
import { css } from 'otion';
import { ChangeEventHandler } from 'react';
import { typography } from 'styles/typography';

const input = css({
    boxSizing: 'border-box',
    backgroundColor: '#fafafa',
    borderRadius: '10px 10px 0 0',
    padding: '0 20px 0 52px',
    fontSize: typography.size[1],
    height: '50px',
    width: '100%',
    border: 'none',
    color: '#2E3A59',
    outline: 'none',
    selectors: {
      '&::placeholder': {
        color: typography.color.tertiary,
      },
    },
});

const result = css({
  padding: '0 20px',
  cursor: 'pointer',
  boxShadow: '0 21px 0 -20px #e5e5e5',
  marginBottom: 1,
  selectors: {
    '&:hover': {
      backgroundColor: '#fbfbfb',
    },
    '&:last-child': {
      boxShadow: 'none',
    },
  },
});

const list = css({
  height: '550px',
  listStyle: 'none',
  overflow: 'scroll',
  boxSizing: 'border-box',
  margin: '0',
  padding: 0,
  borderRadius: '0 0 10px 10px',
});

const container = css({
  position: 'relative',
});

const icon = css({
  position: 'absolute',
  cursor: 'pointer',
  top: '50%',
  left: 20,
  transform: 'translateY(-50%)',
  selectors: {
    '& path': {
      fill: typography.color.primary,
    },
  },
});

const help = css({
  fontSize: typography.size[3],
  color: typography.color.tertiary,
  lineHeight: 1.4,
  padding: '0 20px',
});

interface SearchViewProps {
  search: string;
  onSearch: ChangeEventHandler<HTMLInputElement>;
  onSelect: (entity: Entity) => void;
  disabled: boolean;
  results: Entity[];
}

export function SearchView({ search, onSearch, onSelect, disabled, results }: SearchViewProps): JSX.Element {
  return (
    <>
      <div className={container}>
        <Icon className={icon} name="search" />
        <input
          className={input}
          value={search}
          onChange={onSearch}
          placeholder={
            !disabled
              ? 'Today I want to find...'
              : 'Loading WebAssembly instance...'
          }
          disabled={disabled}
        />
      </div>
      <ul className={list}>
          {search === '' && results.length === 0 && (
            <p className={help}>
              Here are some search ideas: <br />
              Art, Tea, Restorāns, Cafe, Teātris...
            </p>
          )}
          {search !== '' && results.length === 0 && (
            <p className={help}>
              Looks like we couldn't find what you were looking for 🥴
            </p>
          )}
          {results.map((entity) => (
            <li key={entity.id} className={result} onClick={() => onSelect(entity)}>
              <Result key={entity.id} entity={entity} />
            </li>
          ))}
      </ul>
    </>
  );
}
