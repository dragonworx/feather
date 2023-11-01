// force full reload on hot module reload
if (import.meta.hot)
{
    import.meta.hot.accept(() =>
    {
        import.meta.hot!.invalidate();
    });
}