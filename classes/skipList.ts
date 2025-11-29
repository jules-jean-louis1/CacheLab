import { SkipNode } from "./skipNode";

// TODO: Make Comparator
// interface CalculatorInterface {
//   processCalculator(a: any, b: any): any;
// }

// class Comparator implements CalculatorInterface {
//   processCalculator(a: number, b: number) {
//     return a > b ? true : false;
//   }
// }

// class ComparatorString implements CalculatorInterface {
//   processCalculator(a: string, b: string) {
//     return a > b ? true : false;
//   }
// }

export class SkipList {
  private levels: number;
  private p: number;
  public head: SkipNode;
  public tail: SkipNode;

  constructor(levels = 10, p = 0.5) {
    this.levels = levels;
    this.head = new SkipNode(Number.MIN_VALUE);
    this.tail = new SkipNode(Number.MAX_VALUE);
    this.p = p;
  }

  // flipCoin
  flipcoin(): boolean {
    return Math.random() >= this.p;
  }

  // Search
  search(target: number | string): string[] | null {
    let curr: SkipNode | null = this.head;

    // Traverse the skip list
    while (curr) {
      // Move right while the next node's key is less than or equal to the target
      while (
        curr.right !== null &&
        curr.right.key !== null &&
        curr.right.key! <= target
      ) {
        curr = curr.right;
      }

      // If the current node's key matches the target, return its value
      if (curr.key === target) {
        return curr.value;
      }

      // Move down to the next level if possible
      curr = curr.down !== null ? curr.down : null;
    }

    // If the target is not found, return null
    return null;
  }
  // Insert

  insert(key: number | string, value: string) {
    let curr: SkipNode | null = this.head;
    let nodesToUpdate: SkipNode[] = [];
    let keyExists = false;

    // Étape 1 : Trouver les positions à mettre à jour et vérifier si la clé existe
    while (curr) {
      while (curr.right && curr.right.key! < key) {
        curr = curr.right;
      }

      // Vérifier si la clé existe à ce niveau et mettre à jour
      if (curr.right && curr.right.key === key) {
        curr.right.value?.push(value);
        keyExists = true;
      }

      nodesToUpdate.push(curr); // Ajouter le nœud actuel
      curr = curr.down; // Descendre d'un niveau
    }

    // Si la clé existe déjà, on a mis à jour tous les niveaux, donc on peut retourner
    if (keyExists) {
      return;
    }

    // Étape 2 : Insérer le nœud au niveau 0 (seulement si la clé n'existe pas)
    let insertAbove: SkipNode | null = null;
    let level = 0;

    while (nodesToUpdate.length > 0) {
      curr = nodesToUpdate.pop()!; // Dernier nœud à mettre à jour
      const newNode = new SkipNode(key, [value]);

      // Insérer le nouveau nœud
      newNode.right = curr.right;
      curr.right = newNode;

      // Lier les niveaux
      if (insertAbove) {
        newNode.down = insertAbove;
      }
      insertAbove = newNode;

      // Étape 3 : Décider si on ajoute un niveau supérieur
      if (Math.random() > this.p || level >= this.levels) {
        break;
      }
      level++;
    }

    // Étape 4 : Ajouter un nouveau niveau si nécessaire
    if (level > this.levels) {
      const newHead = new SkipNode(Number.MIN_VALUE);
      newHead.down = this.head;
      this.head = newHead;
      this.levels++;
    }
  }

  remove(key: number | string, value: string | null = null): boolean {
    let curr: SkipNode | null = this.head;
    let nodesToDelete: SkipNode[] = [];
    let keyFound = false;

    // Étape 1 : Trouver tous les nœuds précédents à ceux qu'on veut supprimer
    while (curr) {
      while (curr.right && curr.right.key! < key) {
        curr = curr.right;
      }

      // Si on trouve la clé, on garde le nœud précédent (pas celui à supprimer)
      if (curr.right && curr.right.key === key) {
        nodesToDelete.push(curr); // On garde le nœud AVANT celui à supprimer
        keyFound = true;
      }

      curr = curr.down;
    }

    if (!keyFound) {
      return false; // La clé n'existe pas
    }

    // Étape 2 : Supprimer à tous les niveaux
    while (nodesToDelete.length > 0) {
      curr = nodesToDelete.pop()!;

      // Vérifier qu'on a bien un nœud à supprimer
      if (curr.right && curr.right.key === key) {
        // Si on veut supprimer une valeur spécifique
        if (value !== null && curr.right.value) {
          const index = curr.right.value.indexOf(value);
          if (index > -1) {
            curr.right.value.splice(index, 1);
          }

          // Si le tableau devient vide, supprimer le nœud entier
          if (curr.right.value.length === 0) {
            curr.right = curr.right.right; // Court-circuiter le nœud
          }
        } else {
          // Supprimer le nœud entier (toutes les valeurs)
          curr.right = curr.right.right; // Court-circuiter le nœud
        }
      }
    }

    return true;
  }

  printAll() {
    let curr: SkipNode = this.head;
    let node: any[] = [];

    while (curr.down != null) {
      curr = curr.down;
    }

    while (curr.right!) {
      curr = curr.right;
      node.push({ key: curr.key, product_id: curr.value });
    }
    return node;
  }

  range(start: number | string, end: number | string) {
    if (start >= end) return false;

    let curr: SkipNode | null = this.head;
    let startNode: SkipNode = new SkipNode(start);
    let findStart: boolean = false;
    let range: any[] = [];

    // Recherche le start key a l'aide de la SkipList
    while (curr) {
      while (curr.right && curr.right.key! <= start) {
        curr = curr.right;
      }
      if (curr?.down === null && curr.key === start) {
        startNode = curr;
        findStart = true;
      }
      curr = curr.down;
    }

    // Se placer au niveau 0 et itere desus a partir du startNode jusqu'au end.
    if (findStart) {
      while (startNode.right && startNode.right.key! <= end) {
        range.push({ key: startNode.key, value: startNode.value });
        startNode = startNode.right;
      }
      return range;
    }
  }
}
