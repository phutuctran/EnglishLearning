//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace EnglishLearning.Models.EF
{
    using System;
    using System.Collections.Generic;
    
    public partial class Test
    {
        public int ID { get; set; }
        public Nullable<int> Theme_ID { get; set; }
        public Nullable<int> User_ID { get; set; }
        public Nullable<int> Level { get; set; }
        public Nullable<double> Point { get; set; }
        public string Result { get; set; }
        public Nullable<System.DateTime> DateTest { get; set; }
        public Nullable<bool> Status { get; set; }
    
        public virtual Theme Theme { get; set; }
        public virtual User User { get; set; }
    }
}
