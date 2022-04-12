import { Memento } from './Memento';
import { Mino, MinoType } from './mino';
import { Piece } from './piece';
import { Position } from './position';
import { Snapshot } from './snapshot';

class BoardSnapshot implements Snapshot {
  public minos: Mino[][];

  constructor(minos: Mino[][]) {
    this.minos = Board.copyMinos(minos);
  }

  public toJSON() {
    const minos = this.minos.map((col) => {
      return col.map((mino) => {
        return mino.type;
      });
    });

    return {
      width: this.minos.length,
      height: this.minos[0].length,
      minos: minos,
    };
  }
}

//the board is a two dimension array of minos. Minos only have a type for now
class Board implements Memento<BoardSnapshot> {
  constructor(private _minos: Mino[][]) {}

  public static copyMinos(minos: Mino[][]): Mino[][] {
    return minos.map((col) => {
      return col.map((cell) => {
        return new Mino(cell.type);
      });
    });
  }

  public get minos() {
    return this._minos;
  }

  public get width() {
    return this.minos.length;
  }
  public get height() {
    return this.minos[0].length;
  }

  public setMino(x: number, y: number, mino: Mino): void {
    this.minos[x][y] = mino;
  }

  public getMino(x: number, y: number): Mino {
    return this.minos[x][y];
  }

  public inBound(x: number, y: number): boolean {
    if (x >= this.width || x < 0) {
      return false;
    }
    if (y >= this.height || y < 0) {
      return false;
    }
    return true;
  }

  public occupied(x: number, y: number): boolean {
    if (!this.inBound(x, y)) {
      return true;
    }

    return this.minos[x][y].type !== MinoType.empty;
  }

  public clone(): Board {
    const board = Board.copyMinos(this.minos);
    return new Board(board);
  }

  //returns the current board plus the current piece
  public getBoardWithPiece(
    piece: Piece,
    piecePos: Position,
    ghost?: Piece,
    ghostPos?: Position
  ): Board {
    const res = this.clone();

    if (ghost && ghostPos) {
      for (let i = 0; i < ghost.shape.length; i++) {
        const mino = ghost.shape[i];
        const x = ghostPos.x + ghost.centerShift + mino.x;
        const y = ghostPos.y + ghost.centerShift + mino.y;
        if (res.inBound(x, y)) {
          res.minos[x][y] = new Mino(ghost.type);
        }
      }
    }

    for (let i = 0; i < piece.shape.length; i++) {
      const mino = piece.shape[i];
      const x = piecePos.x + piece.centerShift + mino.x;
      const y = piecePos.y + piece.centerShift + mino.y;
      if (res.inBound(x, y)) {
        res.minos[x][y] = new Mino(piece.type);
      }
    }

    return res;
  }

  //returns true if the piece collides or is out of bounds
  public collision(piece: Piece, piecePos: Position): boolean {
    return piece.shape.some((mino) => {
      return this.occupied(
        piecePos.x + piece.centerShift + mino.x,
        piecePos.y + piece.centerShift + mino.y
      );
    });
  }

  public allClear(): boolean {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.minos[x][y].type !== MinoType.empty) {
          return false;
        }
      }
    }

    return true;
  }

  public save(): BoardSnapshot {
    return new BoardSnapshot(this.minos);
  }

  public restore(snapshot: BoardSnapshot): void {
    this._minos = snapshot.minos;
  }
}

export { Board, BoardSnapshot };
