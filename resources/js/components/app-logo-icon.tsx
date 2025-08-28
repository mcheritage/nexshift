import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
      <img
        src="/images/nexshift-logo-icon.JPG"
        alt="NextShift Logo"
        className="h-8 w-auto object-contain"
      />
    );
}
