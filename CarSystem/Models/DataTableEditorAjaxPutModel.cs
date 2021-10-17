using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CarSystem.Models
{
    public class DataTableEditorAjaxPutModel
    {
        public string action { get; set; }

        // public List<SiGroups> data;
        public Dictionary<string, Dictionary<string, string>> data;
    }
}
