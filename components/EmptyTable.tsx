/** The empty light table: a real mount with nothing in its window, honest and material. */
export function EmptyTable() {
  return (
    <section className="empty-table">
      <div className="empty-mount" aria-hidden="true">
        <span className="empty-mount-window" />
        <span className="empty-mount-caption">No slide mounted</span>
      </div>
      <h1 className="empty-title">The table is empty</h1>
      <p className="empty-copy">
        <span className="key">Paste a URL</span> anywhere, or{" "}
        <span className="key">drop a screenshot</span> onto the table. Every save
        develops into a labeled slide: its design type, vocabulary, an image
        prompt, and a build brief you can hand to a model.
      </p>
    </section>
  );
}
