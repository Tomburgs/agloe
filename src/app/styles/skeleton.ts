import { css, keyframes } from 'otion';

export const animation = keyframes({
  from: { backgroundPosition: '-1200px 0' },
  to: { backgroundPosition: '1200px 0' },
});

export const skeleton =
  css({
    backgroundImage:
      'linear-gradient(to right, rgba(0, 0, 0, .08) 0, rgba(0, 0, 0, .15) 15%, rgba(0, 0, 0, .08) 30%)',
    backgroundSize: '1200px 100%',
    animation: `${animation} 2s linear infinite`,
  }) + ' ';
