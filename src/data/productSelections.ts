import type { MotorProduct } from '../types'
import { motors } from './motors'
import { fastechVariantsFor, fastechVariantSpecs, type FastechMotorVariant } from './fastechVariants'

export function productForVariant(product: MotorProduct, variant: FastechMotorVariant): MotorProduct {
  return { ...product, id: `${product.id}::${variant.id}`, model: variant.model, specs: fastechVariantSpecs(product, variant) }
}

export function expandProducts(products: MotorProduct[]): MotorProduct[] {
  return products.flatMap(product => {
    if (product.id.includes('::')) return [product]
    const variants = fastechVariantsFor(product)
    return variants.length ? variants.map(variant => productForVariant(product, variant)) : [product]
  })
}

export const selectionProducts = expandProducts(motors)
const productById = new Map([...motors, ...selectionProducts].map(product => [product.id, product]))
// Retain old series-only bookmarks and links; new selections use a unique model ID.
export function resolveProduct(id: string) { return productById.get(id) }
