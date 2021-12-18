declare type BaseEntity = {
  id: number;
  type: string;
  name: string;
  tags: Record<string, any>;
  metadata: {
    rank: number;
    search: string;
  };
};

/*
 * Node is base entity.
 * Nodes are either as-is or they can be part of Way or Relation structure.
 */
declare type NodeEntity = BaseEntity & {
  type: 'node';
  lat: number;
  lon: number;
};

/*
 * Way entity consists of multiple nodes.
 * Way can be both open & closed.
 */
declare type WayEntity = BaseEntity & {
  type: 'way';
  nodes: Array<{ lon: number, lat: number }>;
};

/*
 * Entity is either Node, Way or Relation.
 * They can be categorized by their `type` property.
 */
declare type Entity = NodeEntity | WayEntity;

/*
 * Golang function to execute text search on OSMPBF
 */
declare function search(term: string): ReadableStream<Entity | Promise<Entity>>;
