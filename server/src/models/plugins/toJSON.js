export function toJSONPlugin(schema) {
  schema.set('toJSON', {
    virtuals: true,
    transform(_doc, ret) {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      if (ret.passwordHash) delete ret.passwordHash;
      if (ret.tokenHash) delete ret.tokenHash;
      return ret;
    },
  });
}
