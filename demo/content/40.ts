export default {
  name: "40 - production component",
  expected: "valid",
  source: String.raw`<script server lang="ts">
import { getUser } from "./auth";
import { getProducts } from "./products";

const user = await getUser();
const products = await getProducts();

async function addToCart(productId: string) {
    await db.cart.insert({
        userId: user.id,
        productId,
        quantity: 1,
    });
}
</script>

<style>
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
}

.product {
    padding: 1rem;
    border-radius: 12px;
}

.product:hover {
    transform: translateY(-2px);
}
</style>

<section class="products">
    <header>
        <h1>Products</h1>
        <p>Hello {user.name}</p>
    </header>

    <div class="product-grid">
        <article class="product" .when={products.length}>
            <h2>{products[0].name}</h2>
            <p>{products[0].description}</p>
            <button .onclick={addToCart(products[0].id)}>
                Add to cart
            </button>
        </article>
    </div>
</section>`,
};
