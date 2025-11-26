import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // 1. Insert Levels
    console.log('📚 Inserting levels...')
    const levels = [
      {
        level_number: 1,
        title: 'Pengenalan dan Variabel',
        description: 'Memahami dasar JavaScript dan penggunaan variabel',
        points: 100,
        theory_content: `
          <h3>Apa itu Variabel?</h3>
          <p>Variabel adalah tempat penyimpanan data dalam memori yang dapat diisi dengan nilai dan nilainya dapat diubah selama program berjalan.</p>
          
          <h4>Jenis-jenis Variabel:</h4>
          <ul>
            <li><strong>var</strong> - Deklarasi variabel dengan function scope</li>
            <li><strong>let</strong> - Deklarasi variabel dengan block scope (modern)</li>
            <li><strong>const</strong> - Deklarasi konstanta yang tidak bisa diubah (modern)</li>
          </ul>

          <h4>Mengapa menggunakan variabel?</h4>
          <p>Variabel memungkinkan kita menyimpan dan mengelola data dengan mudah, membuat kode lebih mudah dibaca dan dipelihara.</p>

          <h4>Kapan menggunakan masing-masing?</h4>
          <ul>
            <li>Gunakan <code>const</code> untuk nilai yang tidak berubah</li>
            <li>Gunakan <code>let</code> untuk nilai yang bisa berubah</li>
            <li>Hindari <code>var</code> untuk kode modern</li>
          </ul>
        `
      },
      {
        level_number: 2,
        title: 'Tipe Data',
        description: 'Mengenal berbagai tipe data dalam JavaScript',
        points: 100,
        theory_content: `
          <h3>Tipe Data dalam JavaScript</h3>
          <p>JavaScript memiliki beberapa tipe data fundamental yang perlu dipahami.</p>
          
          <h4>Tipe Data Primitif:</h4>
          <ul>
            <li><strong>String</strong> - Teks (contoh: "Hello World")</li>
            <li><strong>Number</strong> - Angka (contoh: 42, 3.14)</li>
            <li><strong>Boolean</strong> - True atau false</li>
            <li><strong>Undefined</strong> - Variabel yang belum diberi nilai</li>
            <li><strong>Null</strong> - Nilai kosong yang disengaja</li>
            <li><strong>Symbol</strong> - Nilai unik (ES6+)</li>
            <li><strong>BigInt</strong> - Angka sangat besar (ES2020)</li>
          </ul>

          <h4>Tipe Data Non-Primitif:</h4>
          <ul>
            <li><strong>Object</strong> - Kumpulan key-value pairs</li>
            <li><strong>Array</strong> - Kumpulan nilai yang terurut</li>
            <li><strong>Function</strong> - Blok kode yang dapat dipanggil</li>
          </ul>
        `
      },
      {
        level_number: 3,
        title: 'Operator',
        description: 'Memahami operator aritmatika, perbandingan, dan logika',
        points: 100,
        theory_content: `
          <h3>Operator dalam JavaScript</h3>
          <p>Operator digunakan untuk melakukan operasi pada variabel dan nilai.</p>
          
          <h4>Operator Aritmatika:</h4>
          <ul>
            <li><code>+</code> Penjumlahan</li>
            <li><code>-</code> Pengurangan</li>
            <li><code>*</code> Perkalian</li>
            <li><code>/</code> Pembagian</li>
            <li><code>%</code> Modulus (sisa bagi)</li>
            <li><code>**</code> Eksponensial (ES6)</li>
          </ul>

          <h4>Operator Perbandingan:</h4>
          <ul>
            <li><code>==</code> Sama dengan (loose equality)</li>
            <li><code>===</code> Sama dengan (strict equality)</li>
            <li><code>!=</code> Tidak sama dengan (loose)</li>
            <li><code>!==</code> Tidak sama dengan (strict)</li>
            <li><code>></code> Lebih besar dari</li>
            <li><code><</code> Lebih kecil dari</li>
          </ul>

          <h4>Operator Logika:</h4>
          <ul>
            <li><code>&&</code> AND</li>
            <li><code>||</code> OR</li>
            <li><code>!</code> NOT</li>
          </ul>
        `
      },
      {
        level_number: 4,
        title: 'Kondisional',
        description: 'Mengontrol alur program dengan percabangan',
        points: 150,
        theory_content: `
          <h3>Pernyataan Kondisional</h3>
          <p>Kondisional digunakan untuk mengeksekusi kode berbeda berdasarkan kondisi tertentu.</p>
          
          <h4>if...else if...else</h4>
          <p>Struktur percabangan paling umum:</p>
          <pre><code>if (kondisi1) {
  // kode jika kondisi1 true
} else if (kondisi2) {
  // kode jika kondisi2 true  
} else {
  // kode jika semua kondisi false
}</code></pre>

          <h4>Switch Case</h4>
          <p>Untuk banyak kondisi yang memeriksa nilai yang sama:</p>
          <pre><code>switch (nilai) {
  case nilai1:
    // kode untuk nilai1
    break;
  case nilai2:
    // kode untuk nilai2
    break;
  default:
    // kode default
}</code></pre>

          <h4>Ternary Operator</h4>
          <p>Kondisional satu baris:</p>
          <pre><code>kondisi ? nilaiJikaTrue : nilaiJikaFalse</code></pre>
        `
      },
      {
        level_number: 5,
        title: 'Perulangan',
        description: 'Mengulangi eksekusi kode dengan loop',
        points: 150,
        theory_content: `
          <h3>Perulangan (Loop) dalam JavaScript</h3>
          <p>Loop digunakan untuk mengeksekusi blok kode berulang kali.</p>
          
          <h4>for Loop</h4>
          <p>Loop dengan jumlah iterasi yang diketahui:</p>
          <pre><code>for (inisialisasi; kondisi; increment) {
  // kode yang diulang
}</code></pre>

          <h4>while Loop</h4>
          <p>Loop selama kondisi true:</p>
          <pre><code>while (kondisi) {
  // kode yang diulang
}</code></pre>

          <h4>do...while Loop</h4>
          <p>Loop yang dijalankan minimal sekali:</p>
          <pre><code>do {
  // kode yang diulang  
} while (kondisi);</code></pre>

          <h4>for...of Loop (ES6)</h4>
          <p>Loop untuk iterable objects (Array, String):</p>
          <pre><code>for (const element of array) {
  // kode untuk setiap element
}</code></pre>

          <h4>for...in Loop</h4>
          <p>Loop untuk properti object:</p>
          <pre><code>for (const key in object) {
  // kode untuk setiap properti
}</code></pre>
        `
      },
      {
        level_number: 6,
        title: 'Fungsi',
        description: 'Membuat dan menggunakan fungsi untuk modularitas kode',
        points: 200,
        theory_content: `
          <h3>Fungsi dalam JavaScript</h3>
          <p>Fungsi adalah blok kode yang dapat dipanggil berulang kali.</p>
          
          <h4>Function Declaration</h4>
          <pre><code>function namaFungsi(parameter) {
  // kode fungsi
  return nilai;
}</code></pre>

          <h4>Function Expression</h4>
          <pre><code>const namaFungsi = function(parameter) {
  // kode fungsi
  return nilai;
};</code></pre>

          <h4>Arrow Function (ES6)</h4>
          <pre><code>const namaFungsi = (parameter) => {
  // kode fungsi
  return nilai;
};

// atau untuk satu ekspresi
const namaFungsi = (parameter) => nilai;</code></pre>

          <h4>Parameter dan Argumen</h4>
          <ul>
            <li><strong>Parameter</strong> - Variabel dalam deklarasi fungsi</li>
            <li><strong>Argument</strong> - Nilai yang diteruskan saat memanggil fungsi</li>
            <li><strong>Default Parameters</strong> - Nilai default parameter (ES6)</li>
            <li><strong>Rest Parameters</strong> - Menangkap banyak argumen sebagai array (ES6)</li>
          </ul>
        `
      },
      {
        level_number: 7,
        title: 'Array',
        description: 'Bekerja dengan kumpulan data menggunakan array',
        points: 200,
        theory_content: `
          <h3>Array dalam JavaScript</h3>
          <p>Array adalah struktur data untuk menyimpan kumpulan nilai.</p>
          
          <h4>Membuat Array</h4>
          <pre><code>// Array literal
const arr = [1, 2, 3];

// Constructor
const arr = new Array(1, 2, 3);</code></pre>

          <h4>Method Array Penting:</h4>
          <ul>
            <li><code>push() / pop()</code> - Menambah/menghapus dari akhir</li>
            <li><code>unshift() / shift()</code> - Menambah/menghapus dari awal</li>
            <li><code>map()</code> - Transformasi setiap element</li>
            <li><code>filter()</code> - Menyaring element</li>
            <li><code>reduce()</code> - Mengurangi array menjadi satu nilai</li>
            <li><code>find() / findIndex()</code> - Mencari element</li>
            <li><code>includes()</code> - Mengecek keberadaan element</li>
          </ul>

          <h4>Array Destructuring (ES6)</h4>
          <pre><code>const [first, second, ...rest] = array;</code></pre>

          <h4>Spread Operator (ES6)</h4>
          <pre><code>const newArray = [...array1, ...array2];</code></pre>
        `
      },
      {
        level_number: 8,
        title: 'Object',
        description: 'Mengelola data kompleks dengan object',
        points: 200,
        theory_content: `
          <h3>Object dalam JavaScript</h3>
          <p>Object adalah kumpulan properti yang terdiri dari key-value pairs.</p>
          
          <h4>Membuat Object</h4>
          <pre><code>// Object literal
const obj = {
  property: 'value',
  method: function() { ... }
};

// Constructor
const obj = new Object();</code></pre>

          <h4>Mengakses Properti</h4>
          <pre><code>// Dot notation
obj.property;

// Bracket notation  
obj['property'];</code></pre>

          <h4>Object Methods</h4>
          <ul>
            <li><code>Object.keys()</code> - Array dari keys</li>
            <li><code>Object.values()</code> - Array dari values</li>
            <li><code>Object.entries()</code> - Array dari [key, value] pairs</li>
          </ul>

          <h4>Object Destructuring (ES6)</h4>
          <pre><code>const { property, method } = object;</code></pre>

          <h4>Spread Operator untuk Object (ES6)</h4>
          <pre><code>const newObj = { ...obj1, ...obj2 };</code></pre>
        `
      },
      {
        level_number: 9,
        title: 'ES6+ (Modern JavaScript)',
        description: 'Fitur-fitur modern JavaScript untuk kode yang lebih bersih',
        points: 250,
        theory_content: `
          <h3>Fitur Modern JavaScript (ES6+)</h3>
          
          <h4>Let dan Const</h4>
          <p>Deklarasi variabel dengan block scope:</p>
          <pre><code>let variable = 'bisa diubah';
const constant = 'tidak bisa diubah';</code></pre>

          <h4>Template Literals</h4>
          <p>String dengan embedded expressions:</p>
          <pre><code>const name = 'World';
const greeting = \`Hello \${name}!\`;</code></pre>

          <h4>Arrow Functions</h4>
          <p>Fungsi dengan syntax lebih pendek:</p>
          <pre><code>const add = (a, b) => a + b;</code></pre>

          <h4>Destructuring</h4>
          <p>Ekstrak nilai dari array/object:</p>
          <pre><code>const { name, age } = person;
const [first, second] = array;</code></pre>

          <h4>Modules</h4>
          <p>Import/export kode antar file:</p>
          <pre><code>// export
export const value = 42;
export function function() { ... }

// import  
import { value, function } from './module.js';</code></pre>

          <h4>Promises & Async/Await</h4>
          <p>Menangani operasi asynchronous:</p>
          <pre><code>async function fetchData() {
  const data = await fetch(url);
  return data.json();
}</code></pre>
        `
      },
      {
        level_number: 10,
        title: 'Error Handling dan Debugging',
        description: 'Menangani error dan debugging kode JavaScript',
        points: 250,
        theory_content: `
          <h3>Error Handling dan Debugging</h3>
          
          <h4>Try...Catch</h4>
          <p>Menangani error dengan graceful:</p>
          <pre><code>try {
  // kode yang mungkin error
} catch (error) {
  // tangani error
  console.error(error.message);
} finally {
  // kode yang selalu dijalankan
}</code></pre>

          <h4>Throw Error</h4>
          <p>Melempar error custom:</p>
          <pre><code>if (!valid) {
  throw new Error('Pesan error custom');
}</code></pre>

          <h4>Debugging Tools</h4>
          <ul>
            <li><code>console.log()</code> - Logging dasar</li>
            <li><code>console.error()</code> - Log error</li>
            <li><code>console.table()</code> - Tampilkan data sebagai table</li>
            <li><code>debugger</code> - Breakpoint dalam kode</li>
          </ul>

          <h4>Browser DevTools</h4>
          <ul>
            <li><strong>Sources Panel</strong> - Debugging dengan breakpoints</li>
            <li><strong>Console</strong> - Menjalankan kode dan melihat output</li>
            <li><strong>Network</strong> - Monitor network requests</li>
          </ul>

          <h4>Best Practices</h4>
          <ul>
            <li>Selalu handle potential errors</li>
            <li>Gunakan meaningful error messages</li>
            <li>Test edge cases</li>
            <li>Use linting tools (ESLint)</li>
          </ul>
        `
      }
    ]

    // Insert levels
    const { data: levelsData, error: levelsError } = await supabase
      .from('levels')
      .upsert(levels, { onConflict: 'level_number' })
      .select()

    if (levelsError) {
      throw new Error(`Error inserting levels: ${levelsError.message}`)
    }

    console.log(`✅ Inserted ${levelsData.length} levels`)

    // 2. Insert Challenges
    console.log('🎯 Inserting challenges...')
    const challenges = [
      {
        level_id: levelsData.find(l => l.level_number === 1)?.id,
        title: 'Deklarasi Variabel',
        description: 'Buat variabel nama dengan nilai "JavaScript" dan tampilkan nilainya',
        initial_code: `// Tulis kode Anda di sini\nlet nama = "";\n\n// Tampilkan nilai variabel nama\nconsole.log(nama);`,
        expected_output: 'JavaScript',
        test_cases: [
          { input: 'nama', expected: 'JavaScript' },
          { input: 'typeof nama', expected: 'string' }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 2)?.id,
        title: 'Operasi Tipe Data',
        description: 'Buat variabel dengan tipe data number, string, dan boolean, lalu tampilkan',
        initial_code: `// Buat variabel dengan tipe data yang berbeda\nconst angka = 0;\nconst teks = "";\nconst status = false;\n\n// Tampilkan semua variabel\nconsole.log(angka, teks, status);`,
        expected_output: '42 Hello true',
        test_cases: [
          { input: 'angka', expected: 42 },
          { input: 'teks', expected: 'Hello' },
          { input: 'status', expected: true }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 3)?.id,
        title: 'Operator Aritmatika',
        description: 'Hitung hasil dari 15 + 7 * 3 dan tampilkan hasilnya',
        initial_code: `// Hitung hasil operasi aritmatika\nconst hasil = 0;\n\n// Tampilkan hasil\nconsole.log(hasil);`,
        expected_output: '36',
        test_cases: [
          { input: 'hasil', expected: 36 }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 4)?.id,
        title: 'Percabangan If-Else',
        description: 'Buat program yang mengecek apakah angka positif, negatif, atau nol',
        initial_code: `function cekAngka(angka) {\n  // Tulis logika if-else di sini\n  \n}\n\n// Test dengan nilai berbeda\nconsole.log(cekAngka(5));   // Harus: "Positif"\nconsole.log(cekAngka(-3));  // Harus: "Negatif"\nconsole.log(cekAngka(0));   // Harus: "Nol"`,
        expected_output: 'Positif\nNegatif\nNol',
        test_cases: [
          { input: 'cekAngka(5)', expected: 'Positif' },
          { input: 'cekAngka(-3)', expected: 'Negatif' },
          { input: 'cekAngka(0)', expected: 'Nol' }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 5)?.id,
        title: 'Loop For',
        description: 'Gunakan loop for untuk menampilkan angka 1 sampai 5',
        initial_code: `// Gunakan loop for untuk menampilkan angka 1-5\nfor ( ) {\n  \n}`,
        expected_output: '1\n2\n3\n4\n5',
        test_cases: [
          { input: 'output', expected: '1\\n2\\n3\\n4\\n5' }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 6)?.id,
        title: 'Function Sederhana',
        description: 'Buat fungsi untuk menghitung luas persegi panjang',
        initial_code: `// Buat fungsi hitungLuas di sini\n\n\n// Test fungsi\nconsole.log(hitungLuas(5, 3));  // Harus: 15\nconsole.log(hitungLuas(10, 4)); // Harus: 40`,
        expected_output: '15\n40',
        test_cases: [
          { input: 'hitungLuas(5, 3)', expected: 15 },
          { input: 'hitungLuas(10, 4)', expected: 40 }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 7)?.id,
        title: 'Manipulasi Array',
        description: 'Buat array angka, lalu gunakan map untuk mengalikan setiap element dengan 2',
        initial_code: `const numbers = [1, 2, 3, 4, 5];\n\n// Gunakan map untuk membuat array baru\nconst doubled = ;\n\nconsole.log(doubled);`,
        expected_output: '[2, 4, 6, 8, 10]',
        test_cases: [
          { input: 'doubled', expected: [2, 4, 6, 8, 10] }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 8)?.id,
        title: 'Manipulasi Object',
        description: 'Buat object person dengan properti name dan age, lalu tambahkan properti city',
        initial_code: `// Buat object person\nconst person = {\n  // isi properti di sini\n};\n\n// Tambahkan properti city\n\nconsole.log(person.name, person.age, person.city);`,
        expected_output: 'John 25 Jakarta',
        test_cases: [
          { input: 'person.name', expected: 'John' },
          { input: 'person.age', expected: 25 },
          { input: 'person.city', expected: 'Jakarta' }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 9)?.id,
        title: 'Template Literals',
        description: 'Gunakan template literal untuk membuat string salam',
        initial_code: `const nama = "Budi";\nconst umur = 20;\n\n// Buat string salam menggunakan template literal\nconst salam = "";\n\nconsole.log(salam);`,
        expected_output: 'Halo, nama saya Budi dan saya berumur 20 tahun',
        test_cases: [
          { input: 'salam', expected: 'Halo, nama saya Budi dan saya berumur 20 tahun' }
        ]
      },
      {
        level_id: levelsData.find(l => l.level_number === 10)?.id,
        title: 'Error Handling',
        description: 'Buat fungsi yang melempar error jika input bukan number',
        initial_code: `function validateNumber(input) {\n  // Tulis kode validasi di sini\n  // Jika input bukan number, throw error dengan pesan "Input harus number"\n  // Jika valid, return "Valid: " + input\n}\n\n// Test\nconsole.log(validateNumber(42));     // Harus: "Valid: 42"\nconsole.log(validateNumber("abc"));  // Harus menampilkan error`,
        expected_output: 'Valid: 42\nError: Input harus number',
        test_cases: [
          { input: 'validateNumber(42)', expected: 'Valid: 42' },
          { input: 'validateNumber("abc")', expected: 'Error: Input harus number' }
        ]
      }
    ]

    // Insert challenges
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .upsert(challenges)
      .select()

    if (challengesError) {
      throw new Error(`Error inserting challenges: ${challengesError.message}`)
    }

    console.log(`✅ Inserted ${challengesData.length} challenges`)

    console.log('🎉 Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - ${levelsData.length} levels inserted`)
    console.log(`   - ${challengesData.length} challenges inserted`)

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run seeding
seedDatabase()