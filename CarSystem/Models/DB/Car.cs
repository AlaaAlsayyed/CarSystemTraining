using System;
using System.Collections.Generic;

#nullable disable

namespace CarSystem.Models.DB
{
    public partial class Car
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string PlateNumber { get; set; }
        public string LicanceId { get; set; }
    }
}
