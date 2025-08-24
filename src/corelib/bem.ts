
import { compact } from 'lodash-es';

type Preset = {
  n?: string;
  e?: string;
  m?: string;
  v?: string;
};

type BemModifiers = Record<string, boolean | string | string[]>;
type BemFormatterBlock = (modifiers?: BemModifiers) => string;
type  BemFormatterElem = (elem: string, modifiers?: BemModifiers) => string;
type BemFormatter = BemFormatterBlock & BemFormatterElem;

const genBemFormatter =
  (preset: Preset) =>
  (blockName: string) =>
  (elemOrMods?: string | BemModifiers, argMods?: BemModifiers) => {
    const blockOrElemName =
      preset.n + blockName + (typeof elemOrMods === 'string' ? preset.e + elemOrMods : '');
    const modifiers = typeof elemOrMods === 'string' ? argMods : elemOrMods;

    const modClassNames =
      modifiers &&
      Object.keys(modifiers)
        .map((mod) => {
          const classNameWithModifier = blockOrElemName + preset.m + mod;
          const value = modifiers[mod];
          if (value === false) return [];
          if (value === true) {
            return [classNameWithModifier];
          }
          const vals = Array.isArray(value) ? value : [value];

          return compact(vals.map((v) => v && classNameWithModifier + preset.v + v));
        })
        .flat();

    const classNames: string[] = [blockOrElemName, ...(modClassNames || [])];

    return classNames;
  };

// * https://ru.bem.info/
export const bem = (styles: CSSModuleClasses, blockName: string): BemFormatter => {
  const rawBemFormatter = genBemFormatter({ n: '', e: '__', m: '--', v: '_' })(blockName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (...args) => rawBemFormatter(...(args as any)).map(nm => styles[nm] ?? '').join(' ');
};

export const cn = (...args: (boolean | null | undefined | string)[]): string =>
  args.filter((x) => x).join(' ');
