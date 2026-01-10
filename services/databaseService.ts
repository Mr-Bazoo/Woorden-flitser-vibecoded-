// databaseService.ts
// Uses sql.js (SQLite compiled to WebAssembly) to run a real SQL database in the browser.

export interface Method {
  id: number;
  name: string;
}

export interface Chapter {
  id: number;
  method_id: number;
  year: number;
  name: string;
}

// Global variable to hold the database instance
let db: any = null;

// Initialize the database
const initDB = async () => {
  if (db) return db;

  // sql.js is loaded via <script> tag in index.html, exposing window.initSqlJs
  const SQL = await (window as any).initSqlJs({
    // Locate the WASM file from the CDN
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
  });

  db = new SQL.Database();
  seedDatabase();
  return db;
};

// Create tables and insert initial data
const seedDatabase = () => {
  if (!db) return;

  const schema = `
    CREATE TABLE methods (id INTEGER PRIMARY KEY, name TEXT);
    CREATE TABLE chapters (id INTEGER PRIMARY KEY, method_id INTEGER, year INTEGER, name TEXT);
    CREATE TABLE words (id INTEGER PRIMARY KEY, chapter_id INTEGER, text TEXT);

    -- Seed Methods
    INSERT INTO methods VALUES (1, 'Lijn 3');
    INSERT INTO methods VALUES (2, 'Veilig Leren Lezen (Kim)');
    INSERT INTO methods VALUES (3, 'Staal (Spelling)');
    INSERT INTO methods VALUES (4, 'Taal Actief');

    -- Seed Chapters (Lijn 3)
    INSERT INTO chapters VALUES (101, 1, 3, 'Thema 1: De nieuwe groep');
    INSERT INTO chapters VALUES (102, 1, 3, 'Thema 2: Eet smakelijk');

    -- Seed Chapters (VLL Kim)
    INSERT INTO chapters VALUES (201, 2, 3, 'Kern 1');
    INSERT INTO chapters VALUES (202, 2, 3, 'Kern 2');
    INSERT INTO chapters VALUES (203, 2, 3, 'Kern 3');

    -- Seed Chapters (Staal)
    INSERT INTO chapters VALUES (301, 3, 4, 'Blok 1: Categorie 1-4');
    INSERT INTO chapters VALUES (302, 3, 4, 'Blok 2: Langermaakwoorden');
    INSERT INTO chapters VALUES (303, 3, 5, 'Blok 1: Herhaling');
    INSERT INTO chapters VALUES (304, 3, 5, 'Blok 2: Trema meervoud');

    -- Seed Chapters (Taal Actief)
    INSERT INTO chapters VALUES (401, 4, 5, 'Thema 1: De vakantie');
    INSERT INTO chapters VALUES (402, 4, 6, 'Thema 1: Op reis');

    -- Seed Words (Lijn 3 - T1)
    INSERT INTO words (chapter_id, text) VALUES (101, 'ik'), (101, 'maan'), (101, 'vis'), (101, 'roos'), (101, 'sok');
    
    -- Seed Words (Lijn 3 - T2)
    INSERT INTO words (chapter_id, text) VALUES (102, 'appel'), (102, 'brood'), (102, 'melk');

    -- Seed Words (VLL Kim - K1)
    INSERT INTO words (chapter_id, text) VALUES (201, 'kip'), (201, 'aap'), (201, 'rem');

    -- Seed Words (Staal - B1 G4)
    INSERT INTO words (chapter_id, text) VALUES (301, 'hak'), (301, 'sla'), (301, 'beer'), (301, 'muis');

    -- Seed Words (Staal - B2 G4)
    INSERT INTO words (chapter_id, text) VALUES (302, 'hond'), (302, 'tent'), (302, 'web');

    -- Seed Words (Staal - G5)
    INSERT INTO words (chapter_id, text) VALUES (303, 'eeuw'), (303, 'nieuw'), (304, 'knieën'), (304, 'zeeën');

    -- Seed Words (Taal Actief)
    INSERT INTO words (chapter_id, text) VALUES (401, 'zwemmen'), (402, 'paspoort');
  `;

  db.exec(schema);
};

export const dbService = {
  getMethods: async (): Promise<Method[]> => {
    await initDB();
    const result = db.exec("SELECT * FROM methods");
    if (!result.length) return [];
    
    // Map array of values to objects based on columns
    const columns = result[0].columns;
    const values = result[0].values;
    return values.map((row: any[]) => ({
      id: row[columns.indexOf('id')],
      name: row[columns.indexOf('name')]
    }));
  },

  getYearsForMethod: async (methodId: number): Promise<number[]> => {
    await initDB();
    // Using parameter binding to prevent injection (though purely local here)
    const stmt = db.prepare("SELECT DISTINCT year FROM chapters WHERE method_id = :id ORDER BY year ASC");
    stmt.bind({':id': methodId});
    
    const years: number[] = [];
    while(stmt.step()) {
      const row = stmt.getAsObject();
      years.push(row.year as number);
    }
    stmt.free();
    return years;
  },

  getChapters: async (methodId: number, year: number): Promise<Chapter[]> => {
    await initDB();
    const stmt = db.prepare("SELECT * FROM chapters WHERE method_id = :mid AND year = :yr");
    stmt.bind({':mid': methodId, ':yr': year});
    
    const chapters: Chapter[] = [];
    while(stmt.step()) {
      chapters.push(stmt.getAsObject() as Chapter);
    }
    stmt.free();
    return chapters;
  },

  getWordsByChapter: async (chapterId: number): Promise<string[]> => {
    await initDB();
    const stmt = db.prepare("SELECT text FROM words WHERE chapter_id = :cid");
    stmt.bind({':cid': chapterId});
    
    const words: string[] = [];
    while(stmt.step()) {
      const row = stmt.getAsObject();
      words.push(row.text as string);
    }
    stmt.free();
    return words;
  }
};