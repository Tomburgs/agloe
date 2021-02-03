declare type BaseEntity = {
    id: number;
    type: string;
    name: string;
    tags: Record<string, any>;
};

/*
 * Node is base entity.
 * Nodes are either as-is or they can be part of Way or Relation structure.
 */
declare type Node = BaseEntity & {
    type: 'node';
    lat: number;
    lon: number;
};

/*
 * Way entity consists of multiple nodes.
 * Way can be both open & closed.
 */
declare type Way = BaseEntity & {
    type: 'way';
    centeroid: Record<string, string>;
    bounds: Record<string, string>;
    nodes: Array<Record<string, string>>;
};

/*
 * Entity is either Node, Way or Relation.
 * They can be categorized by their `type` property.
 */
declare type Entity = Node | Way;

/*
 * Golang function to execute text search on OSMPBF
 */
declare function search(term: string): ReadableStream<Entity>;
