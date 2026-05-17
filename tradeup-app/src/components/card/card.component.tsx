import { CardRoot } from './components/card-root/card-root.component';
import { CardHeader } from './components/card-header/card-header.component';
import { CardBody } from './components/card-body/card-body.component';

const Card = { Root: CardRoot, Header: CardHeader, Body: CardBody };

export { Card };
export type { ICardBodyProps } from './components/card-body/card-body.model';
export type { ICardHeaderProps } from './components/card-header/card-header.model';
export type { ICardRootProps } from './components/card-root/card-root.model';
