class Creator {
  private className: string = ''
  private properties: any = {}

  withClassName(name: string) {
    this.className = name
    return this
  }

  withProperties(props: any) {
    this.properties = props
    return this
  }

  async do() {
    // Simulate storing data and returning an id
    return { id: `mock-id-${Date.now()}` }
  }
}

class Data {
  creator() {
    return new Creator()
  }
}

export function getWeaviateClient() {
  return {
    data: new Data(),
  }
}
