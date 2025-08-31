const db = wx.cloud.database()

Page({
  data: {
    flights: [],
    airlineList: [],
    showEditModal: false,
    editingFlight: null,
    selectedAirline: null
  },

  onLoad() {
    this.loadData()
  },

  async loadData() {
    try {
      const [flights, airlines] = await Promise.all([
        db.collection('flights').get(),
        db.collection('airlines').get()
      ])

      this.setData({
        flights: flights.data,
        airlineList: airlines.data
      })
    } catch (error) {
      console.error('Failed to load data:', error)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    }
  },

  addFlight() {
    this.setData({
      showEditModal: true,
      editingFlight: {
        codeshare: []
      }
    })
  },

  editFlight(e) {
    const { id } = e.currentTarget.dataset
    const flight = this.data.flights.find(f => f._id === id)
    if (flight) {
      this.setData({
        showEditModal: true,
        editingFlight: flight,
        selectedAirline: flight.airline
      })
    }
  },

  async deleteFlight(e) {
    const { id } = e.currentTarget.dataset
    try {
      await wx.showModal({
        title: '确认删除',
        content: '确定要删除这个航班吗？',
        showCancel: true
      })

      await db.collection('flights').doc(id).remove()
      wx.showToast({
        title: '删除成功'
      })
      this.loadData()
    } catch (error) {
      console.error('Failed to delete flight:', error)
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      })
    }
  },

  async submitFlight(e) {
    const formData = e.detail.value
    try {
      const flightData = {
        flightNo: formData.flightNo,
        airlineCode: this.data.selectedAirline._id,
        destination: {
          airportZh: formData.destination
        },
        schedule: {
          depTimeLocal: formData.depTime,
          days: formData.days
        },
        codeshare: this.data.editingFlight.codeshare
      }

      if (this.data.editingFlight._id) {
        await db.collection('flights').doc(this.data.editingFlight._id).update({
          data: flightData
        })
      } else {
        await db.collection('flights').add({
          data: flightData
        })
      }

      wx.showToast({
        title: '保存成功'
      })
      this.setData({
        showEditModal: false
      })
      this.loadData()
    } catch (error) {
      console.error('Failed to save flight:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    }
  },

  closeModal() {
    this.setData({
      showEditModal: false,
      editingFlight: null,
      selectedAirline: null
    })
  },

  addCodeshare() {
    const codeshare = this.data.editingFlight.codeshare || []
    codeshare.push({})
    this.setData({
      'editingFlight.codeshare': codeshare
    })
  },

  removeCodeshare(e) {
    const { index } = e.currentTarget.dataset
    const codeshare = this.data.editingFlight.codeshare
    codeshare.splice(index, 1)
    this.setData({
      'editingFlight.codeshare': codeshare
    })
  }
})
