import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
      <img
        src="/favicon.png"
        alt="NexShift Logo"
        className="h-8 w-auto object-contain"
        {...props}
      />
    );
}
