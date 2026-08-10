export default {
  name: "55 - deep html nesting",
  expected: "valid",
  source: String.raw`<main>
    <section>
        <div>
            <article>
                <header>
                    <div>
                        <span>
                            <strong>
                                Deep content
                            </strong>
                        </span>
                    </div>
                </header>

                <div>
                    <p>
                        Paragraph
                    </p>

                    <ul>
                        <li>One</li>
                        <li>Two</li>
                        <li>
                            <span>Three</span>
                        </li>
                    </ul>
                </div>
            </article>
        </div>
    </section>
</main>`,
};
