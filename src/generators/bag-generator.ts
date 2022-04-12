import { GeneratorType } from '../builders/generator-builder';
import { Piece } from '../piece';
import { CanReffil } from './can-refill';
import { Generator, GeneratorSnapshot } from './generator';
import { HasRNG } from './has-rng';
import { LCG } from './lcg';

class BagGeneratorSnapshot extends GeneratorSnapshot {
  public bag: Piece[];
  public rng: LCG;

  constructor(
    queue: Piece[],
    bag: Piece[],
    rng: LCG,
    public hasRefilled: boolean
  ) {
    super(queue);
    this.bag = Generator.cloneQueue(bag);
    this.rng = rng.clone();
  }

  public toJSON() {
    return {
      type: GeneratorType.Bag,
      queue: GeneratorSnapshot.snapshotQueue(this.queue),
      bag: GeneratorSnapshot.snapshotQueue(this.bag),
    };
  }
}

class BagGenerator extends Generator implements HasRNG, CanReffil {
  constructor(
    queue: Piece[],
    protected bag: Piece[],
    protected rng: LCG,
    protected hasRefilled: boolean
  ) {
    super(queue);
  }

  public shouldRefill(nbPreviewPieces: number): boolean {
    return !this.hasRefilled && this.queue.length < nbPreviewPieces;
  }

  public canRefill(): boolean {
    return !this.hasRefilled;
  }

  public refill(): void {
    const newPieces = Generator.cloneQueue(this.bag);
    newPieces.sort(() => 0.5 - this.rng.getNext());
    this.queue.push(...newPieces);
    this.hasRefilled = true;
  }

  public clone(): Generator {
    const queueClone = Generator.cloneQueue(this.queue);
    const bagClone = Generator.cloneQueue(this.bag);
    return new BagGenerator(
      queueClone,
      bagClone,
      this.rng.clone(),
      this.hasRefilled
    );
  }

  public cloneWithNewRNG(): Generator {
    const bagClone = Generator.cloneQueue(this.bag);
    return new BagGenerator(
      [],
      bagClone,
      new LCG(Date.now()),
      this.hasRefilled
    );
  }

  save(): GeneratorSnapshot {
    return new BagGeneratorSnapshot(
      this.queue,
      this.bag,
      this.rng,
      this.hasRefilled
    );
  }

  restore(snapshot: GeneratorSnapshot): void {
    const snapshotConverted = snapshot as BagGeneratorSnapshot;
    this.queue = Generator.cloneQueue(snapshotConverted.queue);
    this.bag = Generator.cloneQueue(snapshotConverted.bag);
    this.rng = snapshotConverted.rng.clone();
    this.hasRefilled = snapshotConverted.hasRefilled;
  }
}

export { BagGenerator };
