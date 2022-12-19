let instanceSymbol = Symbol();

export const getInstanceSymbol = () => instanceSymbol;

export const resetLog = () => {
  instanceSymbol = Symbol();
};
