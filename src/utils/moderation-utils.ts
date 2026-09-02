export function calculateDuration(input: string) {
  const regex = /(\d+)([wdhms])/g;
  let match;
  let totalMilliseconds = 0;

  while ((match = regex.exec(input)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'w':
        totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
        break;
      case 'd':
        totalMilliseconds += value * 24 * 60 * 60 * 1000;
        break;
      case 'h':
        totalMilliseconds += value * 60 * 60 * 1000;
        break;
      case 'm':
        totalMilliseconds += value * 60 * 1000;
        break;
      case 's':
        totalMilliseconds += value * 1000;
        break;
    }
  }

  return totalMilliseconds;
}

export function isDurationValid(input: string) {
  const regex = /(\d+)([wdhms])/g;
  return regex.test(input);
}