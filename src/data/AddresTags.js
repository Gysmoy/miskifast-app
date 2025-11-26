class AddressTags {
    #tags = [
        { id: 'home', icon: 'home', color: '#2790C3', pretty: 'Casa' },
        { id: 'work', icon: 'briefcase', color: '#A03BB1', pretty: 'Trabajo' },
        { id: 'other', icon: 'location', color: '#FF4D4F', pretty: 'Otro' }
    ]

    all = () => this.#tags

    getById = (id) => {
        const tag = this.#tags.find(x => x.id == id)
        return tag || this.#tags.find(x => x.id === 'other')
    }
}

export default AddressTags