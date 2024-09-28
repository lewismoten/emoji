// const personFoldedArms = '\u{1F468}';
// const xx = '👨‍👧‍👦';
// console.log(xx);
const codePoints = '1F469 1F3FB 200D 2764 FE0F 200D 1F468 1F3FE';

const getPadding = (index: number) => {
  return {
    0: 10,
    1: 8,
    2: 8,
    3: 7,
    4: 7,
    5: 7,
    6: 5,
    7: 3
  }[index] ?? 10;
}
codePoints
  .split(' ')
  .map(code => parseInt(code, 16))
  .reduce<number[]>((all, code, index) => {
    all.push(code);
    const text = all.map(code => String.fromCodePoint(code)).join('');
    const codes = all.map(code => code.toString(16)).join(' ');

    const padding = ' '.repeat(getPadding(index));

    console.log(`${index + 1}. ${text} ${padding}${codes}`);
    return all;
  }, []);


console.log(1468 + 2322)
console.log("São Tomé & Príncipe".normalize("NFD").replace(/[\u0300-\u036f]/g, ''));
console.log(String.fromCodePoint(0x1F5E8));// + String.fromCodePoint(0xFE0E))

const variations = '1F469 1F3FB 200D 2764 FE0F 200D 1F468 1F3FE'.split(' ').map(s => parseInt(s, 16));
for (let i = 0; i < 16; i++) {
  variations[4] = 0xFE00 + i;
  console.log(`FE${i.toString(16).padStart(2, '0')} ${variations.map(v => String.fromCodePoint(v)).join('')}`)
}

const tones = [0x1f3ff, 0x1F3FE, 0x1F3FD, 0x1f3FC, 0x1F3FB];
const hairs = [0x1F9B0, 0x1F9B1, 0x1F9B2, 0x1F9B3];
// const skinTone = '1F469 1F3FB'.split(' ').map(s => parseInt(s, 16));
const skinTone = '1F469 200D'.split(' ').map(s => parseInt(s, 16));
console.log(String.fromCodePoint(0x1f469))
// for (let i = 0; i < tones.length; i++) {
// skinTone[1] = tones[i];
for (let h = 0; h < hairs.length; h++) {
  skinTone[2] = hairs[h];
  console.log(`${skinTone[1].toString(16).padStart(2, '0')} ${skinTone.map(v => String.fromCodePoint(v)).join('')}`)
  // }
}
console.log(30 ** 4);
