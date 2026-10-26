import type { ComponentProps } from 'react';

// Normal anchors avoid a Vinext Worker client-routing failure and preserve query strings.
export default function LocalLink(props: ComponentProps<'a'>) {
  return <a {...props} />;
}
