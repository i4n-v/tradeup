interface ISegmentedControlItem {
  key: string;
  label: string;
}

interface ISegmentedControlProps {
  items: ISegmentedControlItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

interface ISegmentedControlViewProps {
  items: ISegmentedControlItem[];
  value: string;
  onChange: (key: string) => void;
  containerClass: string;
}

export type { ISegmentedControlItem, ISegmentedControlProps, ISegmentedControlViewProps };
