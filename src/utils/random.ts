function sfc32(a: number, b: number, c: number, d: number) {
  return function () {
    a |= 0
    b |= 0
    c |= 0
    d |= 0
    let t = (((a + b) | 0) + d) | 0
    d = (d + 1) | 0
    a = b ^ (b >>> 9)
    b = (c + (c << 3)) | 0
    c = (c << 21) | (c >>> 11)
    c = (c + t) | 0
    return (t >>> 0) / 4294967296
  }
}

const seedgen = () => (Math.random() * 2 ** 32) >>> 0
const seed = [806692919, 1899394972, 1349728802, 3131459383]
export const getRandom = () => sfc32(seed[0], seed[1], seed[2], seed[3])
